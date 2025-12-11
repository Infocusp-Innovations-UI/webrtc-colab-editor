export interface User {
    id: string;
    name: string;
    color: string;
}

export function isObjectUser(user: any): user is User {
    return !!user && !!user.id && !!user.name && !!user.color;
}