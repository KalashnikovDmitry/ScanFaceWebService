import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    
    @ApiProperty({ example: 'Иванов Иван', description: 'Фамилия и имя сотрудника' })
    name: string;
  
    @ApiProperty({ example: 'Секретарь', description: 'Должность сотрудника' })
    position: string;
  
    @ApiProperty({ example: 'http://example.com/image.jpg', description: 'Фото сотрудника' })
    photo: string;
  
    @ApiProperty({ example: [0.2, -0.4], description: 'Дескриптор лица' })
    faceDescriptor: number[];
}