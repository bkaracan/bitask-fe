import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UserStatusService } from 'src/app/services/user-status.service';
import { UserDTO } from 'src/app/models/user.dto';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { BoardService } from 'src/app/services/board.service';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UpdateBoardRequestDTO } from 'src/app/models/update-board-request.dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  userFullName: string = '';
  userEmail: string = '';
  userJobTitle: string = '';
  userStatus: string = '';
  userInitials: string = '';
  selectedUserStatus: string = '';
  userStatusList: string[] = [];
  isUserPopupOpen: boolean = false;
  isStatusPopupOpen: boolean = false;
  isBoardPopupOpen: boolean = false;
  isDeletePopupOpen: boolean = false;
  boardIdToDelete: string | null = null;
  newBoardName: string = '';
  placeholderText: string = 'Type the name of the new board';
  isSuccessMessageVisible: boolean = false;
  isErrorMessageVisible = false;
  errorMessage = '';
  boards: any[] = [];
  selectedBoard: any = null;
  isDropdownClicked: boolean = false;
  isBoardEditingPopupOpen = false;
  editedBoardName = '';
  editedBoardMembers: any[] = [];
  availableUsers: any[] = [];
  selectedUser: any;
  membersToAdd: number[] = [];
  membersToRemove: number[] = [];
  boardId: number | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly userStatusService: UserStatusService,
    private readonly authService: AuthenticationService,
    private readonly boardService: BoardService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decodedToken: UserDTO = this.userService.decodeToken(token);
      const fullName = decodedToken.fullName || '';
      const nameParts = fullName.split(' ');
      this.userFullName = fullName;
      this.userEmail = decodedToken.sub;
      this.userJobTitle = decodedToken.jobTitle;
      this.userStatus = decodedToken.userStatus;
      this.userInitials = `${nameParts[0]?.charAt(0) || ''}${
        nameParts[1]?.charAt(0) || ''
      }`;

      this.userStatusService.getAllUserStatus().subscribe((response) => {
        if (response.success) {
          this.userStatusList = response.data.filter(
            (status: string) => status !== 'Offline'
          );
        }
      });
      // Tüm board kayıtlarını almak için
      this.boardService.getAllBoards().subscribe((response) => {
        if (response.success) {
          this.boards = response.data; // Board kayıtlarını set ediyoruz
        } else {
          console.error('Error fetching boards:', response.message);
        }
      });
    } else {
      console.error('JWT token not found!');
    }
  }

  openUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen;
  }

  openStatusPopup() {
    this.isStatusPopupOpen = !this.isStatusPopupOpen;
  }

  openBoardPopup() {
    this.isBoardPopupOpen = !this.isBoardPopupOpen;
  }

  onStatusSelect(status: string): void {
    this.selectedUserStatus = status.toUpperCase();
    this.userStatus = this.selectedUserStatus;
    this.isStatusPopupOpen = false;

    const userCircleElement = document.querySelector(
      '.user-circle'
    ) as HTMLElement | null;
    if (userCircleElement) {
      const statusColors: { [key: string]: string } = {
        ONLINE: '#00ff87',
        BUSY: '#ff4136',
        AWAY: '#ffdb58',
      };
      const color = statusColors[this.selectedUserStatus];
      if (color) {
        (userCircleElement as HTMLElement).style.backgroundColor = color;
      }
    }

    // Statü metninin rengini değiştirme
    const statusTextElement = document.querySelector(
      '.status-container p'
    ) as HTMLElement | null;
    if (statusTextElement) {
      const statusTextColors: { [key: string]: string } = {
        ONLINE: '#00ff87',
        BUSY: '#ff4136',
        AWAY: '#ffdb58',
      };
      const textColor = statusTextColors[this.selectedUserStatus];
      if (textColor) {
        statusTextElement.className = `${this.selectedUserStatus.toLowerCase()}-status`; // Duruma göre sınıf ekleme
      }
    }

    // Statü değiştirme ikonunun rengini değiştirme
    const statusIconElement = document.querySelector(
      '.status-change-icon'
    ) as HTMLElement | null;
    if (statusIconElement) {
      const statusIconColors: { [key: string]: string } = {
        ONLINE: '#00ff87',
        BUSY: '#ff4136',
        AWAY: '#ffdb58',
      };
      const iconColor = statusIconColors[this.selectedUserStatus];
      if (iconColor) {
        (statusIconElement as HTMLElement).style.color = iconColor;
        (statusIconElement as HTMLElement).style.borderColor = iconColor;
      }
    }

    this.userService
      .updateUserStatus(this.selectedUserStatus)
      .subscribe((response) => {
        if (response.success) {
          console.log('Status updated successfully!:', this.selectedUserStatus);
        } else {
          console.error('Status update error:', response.message);
        }
      });
  }

  logout() {
    this.authService.logout().subscribe(
      () => {
        // Başarıyla çıkış yapıldığında anasayfaya yönlendir
        this.router.navigate(['/']);
        localStorage.removeItem('jwtToken'); // JWT'yi temizle
      },
      (error) => {
        console.error('Logout failed', error);
      }
    );
  }

  createBoard(): void {
    // Board ismi boş ise hata mesajı göster
    if (!this.newBoardName.trim()) {
      this.isErrorMessageVisible = true;
      this.errorMessage = 'Board name is required!';
      setTimeout(() => {
        this.isErrorMessageVisible = false;
      }, 2000);
      return;
    }

    if (this.newBoardName.length > 16) {
      this.isErrorMessageVisible = true;
      this.errorMessage = '16 character limit exceeded!';
      setTimeout(() => {
        this.isErrorMessageVisible = false;
      }, 2000); // Uyarı mesajını 2 saniye sonra gizle
      return;
    }

    this.boardService.createBoard(this.newBoardName).subscribe(
      (response: any) => {
        if (response.success) {
          // Başarı durumu
          this.getBoardsFromBackend(); // Backend'den güncel board listesini alır
          this.isSuccessMessageVisible = true;
          this.isErrorMessageVisible = false;
          this.newBoardName = ''; // Input alanını temizliyoruz
          setTimeout(() => {
            this.isSuccessMessageVisible = false;
            this.isBoardPopupOpen = false; // Pop-up'ı kapatıyoruz
          }, 1500);
        } else {
          // Başarısız durum, backend tarafından dönen hata mesajını göster
          this.isErrorMessageVisible = true;
          this.errorMessage =
            response?.data?.error || 'The board already exists!';
          setTimeout(() => {
            this.isErrorMessageVisible = false;
          }, 2000); // Hata mesajı 2 saniye sonra kaybolacak
        }
      },
      (error) => {
        // Ağ veya sunucu hatası durumunda genel bir hata mesajı göster
        this.isErrorMessageVisible = true;
        this.errorMessage = 'An error occurred while creating the board!';
        setTimeout(() => {
          this.isErrorMessageVisible = false;
        }, 2000); // Genel hata mesajı 2 saniye sonra kaybolacak
      }
    );
  }

  onMouseEnter(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    target.style.transform = 'scale(1.2)'; // İkon %20 büyütülür
  }

  onMouseLeave(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    target.style.transform = 'scale(1)'; // İkon normal boyutuna döner
  }

  openDeletePopup(boardId: string): void {
    // Dropdown'ın kapanmasını önlemek için
    this.boardIdToDelete = boardId;
    this.isDeletePopupOpen = true;
  }

  deleteBoard(): void {
    if (!this.boardIdToDelete) return;

    this.boardService.deleteBoard(this.boardIdToDelete).subscribe(
      (response) => {
        if (response.success) {
          // Silinen board'u listeden kaldırıyoruz
          this.boards = this.boards.filter(
            (board) => board.id !== this.boardIdToDelete
          );

          // Eğer silinen board seçiliyse, seçimi sıfırla
          if (
            this.selectedBoard &&
            this.selectedBoard.id === this.boardIdToDelete
          ) {
            this.selectedBoard = null;
          }

          this.isSuccessMessageVisible = true;
          setTimeout(() => {
            this.isSuccessMessageVisible = false;
            this.isDeletePopupOpen = false; // Popup'ı kapat
          }, 1500);
        } else {
          console.error('Board silinirken hata oluştu:', response.message);
        }
      },
      (error) => {
        console.error('Board silinirken hata oluştu:', error);
      }
    );
  }
  cancelDelete(): void {
    this.isDeletePopupOpen = false;
    this.boardIdToDelete = null; // Silme işlemi iptal edildiğinde sıfırla
  }

  getBoardsFromBackend(): void {
    this.boardService.getAllBoards().subscribe(
      (response: any) => {
        if (response.success) {
          this.boards = response.data;
          this.sortBoardsByCreateDate(); // Listeyi frontend tarafında da tekrar sıralıyoruz
        } else {
          console.error('Error fetching boards:', response.message);
        }
      },
      (error) => {
        console.error('An error occurred while fetching boards:', error);
      }
    );
  }

  sortBoardsByCreateDate(): void {
    this.boards.sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);

      // En güncel olan en üste gelecek şekilde sıralama
      return dateB.getTime() - dateA.getTime();
    });
  }

  clearPlaceholder(): void {
    this.placeholderText = ''; // Placeholder'ı temizle
  }

  restorePlaceholder(): void {
    if (!this.newBoardName) {
      this.placeholderText = 'Type the name of the board'; // Eğer input alanı boşsa placeholder'ı geri getir
    }
  }

  updateBoard(): void {
    if (this.boardId !== null && this.newBoardName.trim()) {
      const updateBoardRequestDTO = new UpdateBoardRequestDTO(
        this.boardId, // Ensure this is a number
        this.newBoardName,
        this.membersToAdd,
        this.membersToRemove
      );

      this.boardService.updateBoard(updateBoardRequestDTO).subscribe(
        (response: any) => {
          if (response.success) {
            console.log('Board updated successfully');
          } else {
            console.error('Failed to update the board');
          }
        },
        (error) => {
          console.error('An error occurred while updating the board', error);
        }
      );
    } else {
      console.error('Board ID or new name is missing.');
    }
  }

  // Board seçildiğinde ID atanacak (örnek)
  selectBoard(board: any): void {
    this.boardId = board.id;
    this.newBoardName = board.name; // Varsayılan olarak mevcut board adı gelir
  }

  // Üye ekleme (örnek)
  addMember(memberId: number): void {
    if (!this.membersToAdd.includes(memberId)) {
      this.membersToAdd.push(memberId);
    }
  }

  // Üye çıkarma (örnek)
  removeMember(memberId: number): void {
    if (!this.membersToRemove.includes(memberId)) {
      this.membersToRemove.push(memberId);
    }
  }

  openBoardEditingPopup(board: any): void {
    if (board) {
      this.editedBoardName = board.name;
      this.editedBoardMembers = [...(board.members || [])]; // board.members varsa
      this.isBoardEditingPopupOpen = true;

      // Kullanıcıları API'den çekiyoruz
      this.userService.getAllUsers().subscribe((response) => {
        if (response.success) {
          this.availableUsers = response.data.filter(
            (user: UserDTO) =>
              !this.editedBoardMembers.some((member) => member.id === user.id) // Zaten eklenmiş olan üyeleri hariç tut
          );
        } else {
          console.error('Failed to fetch users:', response.message);
        }
      });
    } else {
      console.error('Selected board is undefined or null');
    }
  }

  addMemberToBoard(user: any) {
    if (!this.editedBoardMembers.includes(user)) {
      this.editedBoardMembers.push(user);
      this.availableUsers = this.availableUsers.filter((u) => u !== user); // Remove from dropdown
    }
  }

  removeMemberFromBoard(member: any) {
    this.editedBoardMembers = this.editedBoardMembers.filter(
      (m) => m !== member
    );
    this.availableUsers.push(member); // Add back to dropdown
  }

  confirmBoardChanges(): void {
    const updateBoardRequestDTO: UpdateBoardRequestDTO = {
      id: this.selectedBoard.id, // Assuming you have a selected board
      name: this.editedBoardName,
      membersToAdd: this.membersToAdd, // Since this is an array of numbers
      membersToRemove: this.membersToRemove, // Since this is an array of numbers
    };

    this.boardService
      .updateBoard(updateBoardRequestDTO)
      .subscribe((response) => {
        if (response.success) {
          // Güncellenen board'u bulup adını değiştir
          const updatedBoardIndex = this.boards.findIndex(
            (board) => board.id === this.selectedBoard.id
          );
          if (updatedBoardIndex !== -1) {
            this.boards[updatedBoardIndex].name = this.editedBoardName; // Yeni board adını set ediyoruz
          }

          this.isSuccessMessageVisible = true;
          setTimeout(() => {
            this.isSuccessMessageVisible = false;
            this.isBoardEditingPopupOpen = false;
          }, 2000);
        } else {
          console.error('Failed to update the board');
        }
      });
  }
}
