import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly links = [
    {
      title: '⏱️ Pomodoro Timer',
      description: 'Stay focused with a simple productivity timer.',
      route: '/pomodoro',
    },
    {
      title: '🛒 Grocery List',
      description: 'Manage your shopping list in one place.',
      route: '/grocery',
    },
    {
      title: '👨‍💻 Portfolio',
      description: 'Explore projects, experience, and work highlights.',
      route: '/portfolio',
    },
    {
      title: '📄 Resume',
      description: 'View a print-friendly resume layout.',
      route: '/resume',
    },
  ];
}