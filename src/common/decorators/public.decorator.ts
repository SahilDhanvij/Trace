import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = "isPublic@sjd@2031";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);