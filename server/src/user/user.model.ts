import { ApiProperty } from '@nestjs/swagger';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface UserCreationAttrs {
    name: string;
    position: string;
    photo: string;
    faceDescriptor: number[];
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserCreationAttrs> {

    @ApiProperty({example: '1', description: 'Уникальный идентификатор'})  
    @Column({type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true})
    id: number;
  
    @ApiProperty({example: 'Иванов Иван', description: 'Фамилия и имя сотрудника'}) 
    @Column({type: DataType.STRING, allowNull: false})
    name: string;
  
    @ApiProperty({example: 'Секретарь', description: 'Должность сотрудника'}) 
    @Column({type: DataType.STRING, allowNull: false})
    position: string;

    @ApiProperty({ example: 'http://example.com/image.jpg', description: 'Фото сотрудника' })
    @Column({type: DataType.STRING})
    photo: string;

    @ApiProperty({ example: [0.2, -0.4], description: 'Дескриптор лица' })
    @Column({ type: DataType.ARRAY(DataType.FLOAT) })
    faceDescriptor: number[];
}