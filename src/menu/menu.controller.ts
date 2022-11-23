import { Controller, Post, Req } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('review')
export class MenuController {
  constructor(private menuService: MenuService) { }

  // @Post('/')
  // setReview(@Req() request: Request) {
  //   return this.menuService.setReview(request);
  // }

}
