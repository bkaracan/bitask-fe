import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
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
  userInitials: string = '';
  isUserPopupOpen: boolean = false;  // Bu değişken popup'ı açıp kapatmak için

  constructor(private userService: UserService) {}

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
      this.userInitials = `${nameParts[0]?.charAt(0) || ''}${nameParts[1]?.charAt(0) || ''}`;
  
      console.log('User Info:', decodedToken);
    } else {
      console.error('JWT token bulunamadı!');
    }
  }
  
  
  

  openUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen;  // Popup'ı aç/kapat
  }
}
