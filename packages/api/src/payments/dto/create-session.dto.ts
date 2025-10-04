import { IsArray, ArrayNotEmpty, IsUrl, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;
}

export class CreateSessionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items!: CreateItemDto[];

  @IsUrl({ require_tld: process.env.NODE_ENV === 'production' })
  success_url!: string;

  @IsUrl({ require_tld: process.env.NODE_ENV === 'production' })
  cancel_url!: string;
}
