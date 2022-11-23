import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { TreeLevelColumn } from "typeorm";

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'QAZqaz1206@@',
  database: 'dbms_espreso',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  // _dirname
  synchronize: true
}