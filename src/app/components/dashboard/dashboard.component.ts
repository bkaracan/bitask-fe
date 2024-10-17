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
  newBoardName: string = '';
  placeholderText: string = 'Type the name of the new board';
  isSuccessMessageVisible: boolean = false;
  isErrorMessageVisible = false;
  errorMessage = '';

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

    this.boardService.createBoard(this.newBoardName)
        .subscribe(
            (response: any) => {
                if (response.success) {
                    // Başarı durumu
                    this.isSuccessMessageVisible = true;
                    this.isErrorMessageVisible = false;
                    this.newBoardName = '';
                    setTimeout(() => {
                        this.isSuccessMessageVisible = false;
                        this.isBoardPopupOpen = false;
                    }, 1500);
                } else {
                    // Başarısız durum, backend tarafından dönen hata mesajını göster
                    this.isErrorMessageVisible = true;
                    this.errorMessage = response?.data?.error || 'The board already exists!';
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

  


  clearPlaceholder(): void {
    this.placeholderText = '';
  }

  resetPlaceholder(): void {
    if (!this.newBoardName) {
      this.placeholderText = 'Type the name of the new board';
    }
  }
}
