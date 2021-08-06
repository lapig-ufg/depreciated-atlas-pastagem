import {Component, ChangeDetectorRef, AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-site-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css']
})
export class BaseComponent implements  AfterViewInit {


  public year = (new Date()).getFullYear();
  public theme = 'light'
  public checked = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    document.getElementById("movetop").style.display = "none";
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);

      if (currentTheme === 'dark') {
       this.checked = true;
      }
    }
    this.cdr.detectChanges();

    const self = this;

    window.onscroll = function () {
      self.scrollFunction()
    };
  }

  switchTheme(e) {
    this.checked = !this.checked;
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      this.checked = true;
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      this.checked = false;
    }
  }

  scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("movetop").style.display = "block";
    } else {
      document.getElementById("movetop").style.display = "none";
    }
  }
}
