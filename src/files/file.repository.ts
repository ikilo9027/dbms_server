import { EntityRepository, Repository } from "typeorm";
import { Files } from './file.entity'

@EntityRepository(Files)
export class FileRepository extends Repository<Files>{
}