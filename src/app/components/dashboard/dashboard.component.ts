import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { UserStatusService } from 'src/app/services/user-status.service';  // UserStatusService'i import edin
import { UserDTO } from 'src/app/models/user.dto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  userFullName: string = '';
  userEmail: string = '';
  userJobTitle: string = '';
  userStatus: string = '';
  userInitials: string = '';
  selectedUserStatus: string = '';
  userStatusList: string[] = [];  // userStatusList değişkeni eklendi
  isUserPopupOpen: boolean = false;
  isStatusPopupOpen: boolean = false;  // Bu değişkeni ekliyoruz
  isDropdownOpen: boolean = false;

  constructor(private userService: UserService, private userStatusService: UserStatusService) {}

  ngOnInit() {
    const token = localStorage.getItem('jwtToken');  // Token'ı localStorage'dan alıyoruz
    if (token) {
      const decodedToken: UserDTO = this.userService.decodeToken(token);
      
      // fullName'i token'dan çekiyoruz
      const fullName = decodedToken.fullName || '';  
      const nameParts = fullName.split(' ');  // Ad ve soyadı ayırmak için
      this.userFullName = fullName;
      this.userEmail = decodedToken.sub;  // Email token'daki 'sub' alanından geliyor
      this.userJobTitle = decodedToken.jobTitle;
      this.userStatus = decodedToken.userStatus;
      this.userInitials = `${nameParts[0]?.charAt(0) || ''}${nameParts[1]?.charAt(0) || ''}`;
      
      console.log('User Info:', decodedToken);
  
      // Kullanıcı statülerini getirirken "Offline" seçeneğini filtreleyelim
      this.userStatusService.getAllUserStatus().subscribe(response => {
        if (response.success) {
          this.userStatusList = response.data.filter((status: string) => status !== 'Offline');
          console.log("Kullanıcı Statüleri:", this.userStatusList);
        }
      });
    } else {
      console.error('JWT token bulunamadı!');
    }
  }

  onStatusChange(): void {
    console.log("Seçilen statü:", this.selectedUserStatus);
  }

  openUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen;
  }

  openStatusPopup() {
    this.isStatusPopupOpen = !this.isStatusPopupOpen;  // Bu fonksiyonu ekliyoruz
  }

  onStatusSelect(status: string): void {
    this.selectedUserStatus = status.toUpperCase();  // Statüyü büyük harfe çeviriyoruz
    this.userStatus = this.selectedUserStatus;
    this.isStatusPopupOpen = false;
  
    // Statü değişikliği backend'e büyük harf olarak gönderiliyor
    this.userService.updateUserStatus(this.selectedUserStatus).subscribe(response => {
      if (response.success) {
        console.log("Statü başarıyla güncellendi:", this.selectedUserStatus);
      } else {
        console.error("Statü güncelleme hatası:", response.message);
      }
    });
  }

  toggleStatusDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
