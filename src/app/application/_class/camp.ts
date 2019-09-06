export class Camp {

    public description: string;
    public name: string;
    public participants: number;
    public year: string;
    public id: string;

    constructor(data: unknown, id: string) {

        this.description = data["description"];
        this.name = data["name"];
        this.participants = data["participants"];
        this.year = data["year"];
        this.id = id;

    }



}
