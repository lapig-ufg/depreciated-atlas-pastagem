import {Component, ElementRef, ViewChild,ChangeDetectorRef, AfterViewInit} from '@angular/core';
declare var $;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements  AfterViewInit {

  public video: any;
  public player: any;
  public year = (new Date()).getFullYear();
  public reframed: Boolean = false;
  public theme = 'light'
  public checked = false;
  public scritps = [
    'https://www.youtube.com/iframe_api'
  ];

  @ViewChild('owl') owl: ElementRef;
  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {

    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme);

      if (currentTheme === 'dark') {
       this.checked = true;
      }
    }

    this.video = 'ZZnHtkblmro';

    const firstScriptTag = document.getElementsByTagName('script')[0];

    for(let src of this.scritps){
      const tag = document.createElement('script');
      tag.src = src
      tag.type = 'text/javascript';
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    this.cdr.detectChanges();
    $(this.owl.nativeElement).owlCarousel({
      loop: true,
      nav: false,
      margin: 15,
      stagePadding: 20,
      responsiveClass: true,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplaySpeed: 1000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
          nav: false
        },
        736: {
          items: 1,
          nav: false
        },
        991: {
          items: 2,
          margin: 30,
          nav: false
        },
        1080: {
          items: 4,
          nav: false
        }
      }
    })
  }

  startVideo() {
    this.reframed = false;
    this.player = new window['YT'].Player('video', {
      videoId: this.video,
      Host: 'https://www.youtube.com',
      width: window.innerWidth,
      height: window.innerHeight,
      playerVars: {
        vq: 'hd1080',
        html5: 1,
        autohide: 1,
        autoplay: 1,
        modestbranding: 1,
        controls: 0,
        loop: 1,
        disablekb: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1,
        Origin:'https://atlas-homolog.lapig.iesa.ufg.br/'
      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });

  }

  /*It will be called when the Video Player is ready */
  onPlayerReady(event) {
    event.target.playVideo();
  }

  /* API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event) {
    switch (event.data) {
      case window['YT'].PlayerState.ENDED:
        event.target.playVideo();
        break;
    }
  }

  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  }

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
  }
}
