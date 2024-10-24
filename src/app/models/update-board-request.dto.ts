export class UpdateBoardRequestDTO {
  constructor(
    public id: number, // Board ID
    public name: string, // New board name
    public membersToAdd: number[], // Array of user IDs to add
    public membersToRemove: number[] // Array of user IDs to remove
  ) {}
}
