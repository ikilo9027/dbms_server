import { Controller, Post, Req, NotFoundException, UseFilters, HttpException } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/authId')
  @ApiBody({
    required: true,
    schema: {
      example: {
        user_id: '아이디',
        user_passwd: '패스워드'
      },
    }
  })
  @ApiResponse({
    status: 201,
    description: 'succeess.',
    schema: {
      example: {
        data: {
          did: 'String',
          sid: 'String'
        },
        success: true
      },
    }
  })
  @ApiResponse({
    status: 400,
    description: 'error.',
    schema: {
      example: {
        error: {
          code: 400
        },
        success: false
      },
    }
  })
  async getAuthId(@Req() request: Request) {
    console.log('+++++++++++++++++++++++++++++++++')
    return this.authService.getAuthId(request);
  }

}
