import bcrypt from "bcrypt";

const SALT=10;

export async function hashPassword(plainPassword:string): Promise<string> {
    return bcrypt.hash(plainPassword,SALT);
}

export async function comparePassword(plainPassword:string,hashPassword:string): Promise<boolean> {
    return bcrypt.compare(plainPassword,hashPassword);
}