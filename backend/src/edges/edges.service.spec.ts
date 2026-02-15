import { Test, TestingModule } from '@nestjs/testing';
import { EdgesService } from './edges.service';

describe('EdgesService', () => {
  let service: EdgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdgesService],
    }).compile();

    service = module.get<EdgesService>(EdgesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
