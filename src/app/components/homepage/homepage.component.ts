import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.typeEffect();
  }

  navigateToRegistration() {
    this.router.navigate(['/registration']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']); // Login sayfasına yönlendirme yapar
  }

  typeEffect() {
    const text = "Fast, planned and organized.";
    const typedTextElement = document.getElementById('typed-text');
    const cursorElement = document.getElementById('cursor');
    let index = 0;

    function typeCharacter() {
      if (index < text.length) {
        typedTextElement!.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeCharacter, 100);
      } else {
        cursorElement!.style.display = 'none';
        // Butonları görünür yap
        const buttonsContainerElement = document.getElementById('buttons-container');
        buttonsContainerElement!.classList.add('button-visible');
      }
    }

    setTimeout(typeCharacter, 500);
  }
}
