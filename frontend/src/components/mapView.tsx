"use client";

import type * as THREE from "three";
import { useEffect, useRef } from "react";
import { Node, Edge } from "@/types";

interface MapViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  connectingFromId: string | null;
  homeNodeId: string | null;
  onNodeClick: (node: Node) => void;
  onGlobeClick?: (lat: number, lng: number) => void;
}

export default function MapView({
  nodes,
  edges,
  selectedNodeId,
  connectingFromId,
  homeNodeId,
  onNodeClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internals = useRef<any>(null);

  // ── Mount scene once ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || internals.current) return;
    let dead = false;

    import("three").then((T) => {
      if (dead || !el) return;
      const W = el.clientWidth || window.innerWidth;
      const H = el.clientHeight || window.innerHeight;

      // renderer
      const ren = new T.WebGLRenderer({ antialias: true });
      ren.setSize(W, H);
      ren.setPixelRatio(Math.min(devicePixelRatio, 2));
      ren.setClearColor(0x000308);
      ren.domElement.style.display = "block";
      el.appendChild(ren.domElement);

      const scene = new T.Scene();
      const cam = new T.PerspectiveCamera(42, W / H, 0.1, 500);
      cam.position.set(0, 0, 4.5);

      // resize
      const onRz = () => {
        cam.aspect = el.clientWidth / el.clientHeight;
        cam.updateProjectionMatrix();
        ren.setSize(el.clientWidth, el.clientHeight);
      };
      window.addEventListener("resize", onRz);

      // ── Stars ─────────────────────────────────────────────────
      (() => {
        const N = 8000, p = new Float32Array(N * 3), s = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(2 * Math.random() - 1);
          const r = 80 + Math.random() * 80;
          p[i*3] = r*Math.sin(ph)*Math.cos(th);
          p[i*3+1] = r*Math.sin(ph)*Math.sin(th);
          p[i*3+2] = r*Math.cos(ph);
          s[i] = Math.random() * 1.5 + 0.3;
        }
        const g = new T.BufferGeometry();
        g.setAttribute("position", new T.BufferAttribute(p, 3));
        g.setAttribute("size", new T.BufferAttribute(s, 1));
        scene.add(new T.Points(g, new T.ShaderMaterial({
          vertexShader: `attribute float size;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*(200./-mv.z);gl_Position=projectionMatrix*mv;}`,
          fragmentShader: `void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(.85,.9,1.,(1.-d*d)*.7);}`,
          transparent: true, blending: T.AdditiveBlending, depthWrite: false,
        })));
      })();

      // ── Globe ─────────────────────────────────────────────────
      const globe = new T.Group();
      scene.add(globe);

      const tex = new T.TextureLoader().load(
        "https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg"
      );
      (tex as any).colorSpace = "srgb";

      const earth = new T.Mesh(
        new T.SphereGeometry(1, 128, 80),
        new T.ShaderMaterial({
          uniforms: { uTex: { value: tex }, uTime: { value: 0 } },
          vertexShader: `
            varying vec3 vN,vW; varying vec2 vUv;
            void main(){
              vN=normalize(normalMatrix*normal);
              vW=(modelMatrix*vec4(position,1.)).xyz;
              vUv=uv;
              gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
            }`,
          fragmentShader: `
            precision highp float;
            uniform sampler2D uTex;
            varying vec3 vN,vW; varying vec2 vUv;
            void main(){
              vec3 vd=normalize(cameraPosition-vW);
              float rawDot=dot(vd,vN), face=abs(rawDot), rim=1.-face;
              float isFront=step(0.,rawDot);
              float backFade=isFront+(1.-isFront)*.3;
              vec4 tx=texture2D(uTex,vUv);
              float bd=tx.b-max(tx.r,tx.g);
              float land=1.-smoothstep(-.05,.12,bd);
              float coast=land*(1.-land)*4.;
              vec3 c=vec3(0.);
              c+=vec3(.03,.18,.3)*land;
              c+=vec3(0.,.55,.85)*coast;
              c+=tx.rgb*land*.06;
              c+=vec3(0.,.18,.5)*pow(rim,2.2)*.55;
              c*=.45+.55*face; c*=backFade;
              float a=land*.2+coast*.35+pow(rim,2.2)*.15;
              a=max(a,.012); a*=backFade;
              gl_FragColor=vec4(c,a);
            }`,
          transparent: true, depthWrite: false, side: T.DoubleSide,
        })
      );
      globe.add(earth);

      // atmosphere inner
      globe.add(new T.Mesh(
        new T.SphereGeometry(1.12, 64, 48),
        new T.ShaderMaterial({
          vertexShader: `varying vec3 vN,vW;void main(){vN=normalize(normalMatrix*normal);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `varying vec3 vN,vW;void main(){float rim=1.-abs(dot(normalize(cameraPosition-vW),vN));float g=pow(rim,1.4)*1.3;vec3 c=mix(vec3(0.,.12,.85),vec3(0.,.55,1.),rim);gl_FragColor=vec4(c*g,g*.85);}`,
          transparent: true, blending: T.AdditiveBlending, side: T.BackSide, depthWrite: false,
        })
      ));
      // atmosphere outer
      globe.add(new T.Mesh(
        new T.SphereGeometry(1.32, 48, 32),
        new T.ShaderMaterial({
          vertexShader: `varying vec3 vN,vW;void main(){vN=normalize(normalMatrix*normal);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `varying vec3 vN,vW;void main(){float rim=1.-abs(dot(normalize(cameraPosition-vW),vN));float g=pow(rim,2.8)*.55;gl_FragColor=vec4(0.,.22,1.,g);}`,
          transparent: true, blending: T.AdditiveBlending, side: T.BackSide, depthWrite: false,
        })
      ));

      // ── Coordinate helpers ────────────────────────────────────
      function ll(lat: number, lng: number, r = 1) {
        const p = (90 - lat) * Math.PI / 180, t = (lng + 180) * Math.PI / 180;
        return new T.Vector3(-r*Math.sin(p)*Math.cos(t), r*Math.cos(p), r*Math.sin(p)*Math.sin(t));
      }
      function bez(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) {
        const m = 1 - t;
        return new T.Vector3(
          m*m*a.x+2*m*t*b.x+t*t*c.x,
          m*m*a.y+2*m*t*b.y+t*t*c.y,
          m*m*a.z+2*m*t*b.z+t*t*c.z
        );
      }

      // ── Data groups ───────────────────────────────────────────
      const nodeGrp = new T.Group();
      const arcGrp = new T.Group();
      globe.add(nodeGrp);
      globe.add(arcGrp);

      type NObj = { group: THREE.Group; pulse: THREE.Mesh; pm: THREE.MeshBasicMaterial; pos: THREE.Vector3; id: string; home: boolean };
      type AObj = { dot: THREE.Mesh; dm: THREE.MeshBasicMaterial; from: THREE.Vector3; mid: THREE.Vector3; to: THREE.Vector3; t: number; spd: number };

      let nObjs: NObj[] = [];
      let aObjs: AObj[] = [];
      let curNodes: Node[] = [];

      const dotGeo = new T.SphereGeometry(0.008, 8, 6);

      function rebuild(ns: Node[], es: Edge[], selId: string | null, hId: string | null) {
        // clear
        while (nodeGrp.children.length) nodeGrp.remove(nodeGrp.children[0]);
        while (arcGrp.children.length) arcGrp.remove(arcGrp.children[0]);
        nObjs = [];
        aObjs = [];
        curNodes = ns;

        // nodes
        ns.forEach(n => {
          const isHome = n.id === hId;
          const isSel = n.id === selId;
          const col = isSel ? 0x38bdf8 : 0xffc234;
          const sz = isHome ? 0.025 : 0.018;
          const pos = ll(Number(n.latitude), Number(n.longitude), 1.016);
          const g = new T.Group();
          g.position.copy(pos);
          // core
          g.add(new T.Mesh(new T.SphereGeometry(sz, 12, 8), new T.MeshBasicMaterial({ color: col, transparent: true, blending: T.AdditiveBlending, depthWrite: false })));
          // glow
          g.add(new T.Mesh(new T.SphereGeometry(sz*2.5, 12, 8), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false })));
          // pulse
          const pm = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.08, blending: T.AdditiveBlending, depthWrite: false });
          const pulse = new T.Mesh(new T.SphereGeometry(sz*5, 12, 8), pm);
          g.add(pulse);
          nodeGrp.add(g);
          nObjs.push({ group: g, pulse, pm, pos, id: n.id, home: isHome });
        });

        // arcs
        es.forEach(e => {
          const f = ns.find(n => n.id === e.fromId);
          const t2 = ns.find(n => n.id === e.toId);
          if (!f || !t2) return;
          const from = ll(Number(f.latitude), Number(f.longitude), 1.016);
          const to = ll(Number(t2.latitude), Number(t2.longitude), 1.016);
          const mid = from.clone().add(to).multiplyScalar(0.5).normalize();
          mid.multiplyScalar(1.1 + from.distanceTo(to) * 0.55);
          // arc line
          const pts: THREE.Vector3[] = [];
          for (let i = 0; i <= 100; i++) pts.push(bez(from, mid, to, i / 100));
          arcGrp.add(new T.Line(
            new T.BufferGeometry().setFromPoints(pts),
            new T.LineBasicMaterial({ color: 0xffc234, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })
          ));
          // travelling dot
          const dm = new T.MeshBasicMaterial({ color: 0xffc234, transparent: true, blending: T.AdditiveBlending, depthWrite: false });
          const dot = new T.Mesh(dotGeo, dm);
          arcGrp.add(dot);
          aObjs.push({ dot, dm, from, mid, to, t: Math.random(), spd: 0.0007 + Math.random() * 0.0004 });
        });
      }

      // ── Controls (manual, matches reference) ──────────────────
      let rx = 0.25, ry = 0.6, trx = 0.25, tryy = 0.6;
      let zm = 4.5, tzm = 4.5;
      let drag = false, lx = 0, ly = 0, autoR = true;
      let mx = W / 2, my = H / 2;
      let artTimer: ReturnType<typeof setTimeout>;

      const cv = ren.domElement;
      cv.style.cursor = "grab";
      cv.addEventListener("mousedown", e => { drag = true; lx = e.clientX; ly = e.clientY; autoR = false; clearTimeout(artTimer); });
      window.addEventListener("mouseup", () => { drag = false; artTimer = setTimeout(() => autoR = true, 2800); });
      window.addEventListener("mousemove", e => {
        mx = e.clientX; my = e.clientY;
        if (!drag) return;
        tryy += (e.clientX - lx) * 0.006;
        trx += (e.clientY - ly) * 0.004;
        trx = Math.max(-1.3, Math.min(1.3, trx));
        lx = e.clientX; ly = e.clientY;
      });
      cv.addEventListener("wheel", e => { tzm = Math.max(1.8, Math.min(7, tzm + e.deltaY * 0.003)); }, { passive: true });
      cv.addEventListener("touchstart", e => { if (e.touches.length === 1) { drag = true; lx = e.touches[0].clientX; ly = e.touches[0].clientY; autoR = false; } }, { passive: true });
      cv.addEventListener("touchend", () => { drag = false; setTimeout(() => autoR = true, 2800); });
      cv.addEventListener("touchmove", e => { if (!drag || e.touches.length !== 1) return; tryy += (e.touches[0].clientX - lx) * 0.006; trx += (e.touches[0].clientY - ly) * 0.004; trx = Math.max(-1.3, Math.min(1.3, trx)); lx = e.touches[0].clientX; ly = e.touches[0].clientY; }, { passive: true });

      // ── Tooltip ────────────────────────────────────────────────
      const tip = document.createElement("div");
      tip.style.cssText = "position:absolute;pointer-events:none;z-index:10;background:rgba(0,0,0,.88);border:1px solid rgba(255,194,52,.5);color:#ffc234;font-size:9px;letter-spacing:2px;padding:5px 12px;transform:translate(-50%,-240%);opacity:0;transition:opacity .2s;text-transform:uppercase;white-space:nowrap;font-family:'Courier New',monospace";
      el.style.position = "relative";
      el.appendChild(tip);

      // ── Click ──────────────────────────────────────────────────
      let didDrag = false;
      cv.addEventListener("mousedown", () => { didDrag = false; });
      window.addEventListener("mousemove", () => { if (drag) didDrag = true; });
      cv.addEventListener("mouseup", () => {
        if (didDrag) return;
        const gc = new T.Vector3();
        globe.getWorldPosition(gc);
        let best: NObj | null = null, bd = 30;
        nObjs.forEach(nd => {
          const wp = nd.pos.clone().applyMatrix4(globe.matrixWorld);
          if (wp.clone().sub(gc).normalize().dot(cam.position.clone().sub(wp).normalize()) < 0.1) return;
          const pr = wp.clone().project(cam);
          const d = Math.hypot((pr.x*.5+.5)*el.clientWidth - mx, (-pr.y*.5+.5)*el.clientHeight - my);
          if (d < bd) { bd = d; best = nd; }
        });
        if (best) {
          const node = curNodes.find(n => n.id === (best as NObj).id);
          if (node) onNodeClick(node);
        }
      });

      // ── Animate ────────────────────────────────────────────────
      const gc = new T.Vector3();
      let aid = 0;

      function loop() {
        if (dead) return;
        aid = requestAnimationFrame(loop);
        const t = performance.now() * 0.001;

        if (autoR) tryy += 0.00048;
        rx += (trx - rx) * 0.08;
        ry += (tryy - ry) * 0.08;
        zm += (tzm - zm) * 0.07;
        globe.rotation.x = rx;
        globe.rotation.y = ry;
        cam.position.z = zm;
        (earth.material as any).uniforms.uTime.value = t;

        // arc dots
        aObjs.forEach(a => {
          a.t = (a.t + a.spd) % 1;
          const fade = Math.sin(a.t * Math.PI);
          a.dot.position.copy(bez(a.from, a.mid, a.to, a.t));
          a.dot.scale.setScalar(fade * 1.5 + 0.5);
          a.dm.opacity = fade * 0.9;
        });

        // node pulse
        nObjs.forEach((nd, i) => {
          const pv = nd.home ? 0.8 + 0.3 * Math.sin(t * 2.2) : 0.8 + 0.3 * Math.sin(t * 2.2 + i * 0.7);
          nd.pulse.scale.setScalar(pv);
          nd.pm.opacity = (nd.home ? 0.1 : 0.08) * (2 - pv);
        });

        // tooltip
        const cw = el?.clientWidth ?? W;
        const ch = el?.clientHeight ?? H;
        globe.getWorldPosition(gc);
        let best: NObj | null = null, bd = 50;
        nObjs.forEach(nd => {
          const wp = nd.pos.clone().applyMatrix4(globe.matrixWorld);
          if (wp.clone().sub(gc).normalize().dot(cam.position.clone().sub(wp).normalize()) < 0.1) return;
          const pr = wp.clone().project(cam);
          const d = Math.hypot((pr.x*.5+.5)*cw - mx, (-pr.y*.5+.5)*ch - my);
          if (d < bd) { bd = d; best = nd; }
        });
        if (best) {
          const nd = best as NObj;
          const wp = nd.pos.clone().applyMatrix4(globe.matrixWorld).project(cam);
          tip.style.left = (wp.x*.5+.5)*cw + "px";
          tip.style.top = (-wp.y*.5+.5)*ch + "px";
          const name = curNodes.find(n => n.id === nd.id)?.name ?? "";
          tip.textContent = (nd.home ? "⌂ " : "◉ ") + name;
          tip.style.opacity = "1";
          cv.style.cursor = "pointer";
        } else {
          tip.style.opacity = "0";
          cv.style.cursor = drag ? "grabbing" : "grab";
        }

        ren.render(scene, cam);
      }
      loop();

      internals.current = {
        rebuild,
        destroy() {
          dead = true;
          cancelAnimationFrame(aid);
          window.removeEventListener("resize", onRz);
          ren.dispose();
          ren.domElement.remove();
          tip.remove();
        },
      };
    });

    return () => {
      dead = true;
      internals.current?.destroy();
      internals.current = null;
    };
  }, []);

  // ── Sync props → scene ──────────────────────────────────────────
  useEffect(() => {
    internals.current?.rebuild(nodes, edges, selectedNodeId, homeNodeId);
  }, [nodes, edges, selectedNodeId, connectingFromId, homeNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ background: "#000308" }} />
  );
}
