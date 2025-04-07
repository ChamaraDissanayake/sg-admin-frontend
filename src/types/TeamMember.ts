export type TeamMember = {
    id?: number;
    name: string;
    position: string;
    imagePath: string;
    bio?: string;
}

export type ApiTeamMember = {
    id: number;
    name: string;
    position: string;
    bio?: string;
    image_path: string;
};