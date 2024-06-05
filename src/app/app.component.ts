import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataService } from './services/data/data.service';
import { LayerService } from './services/layer/layer.service';
import { ILayer } from './types/layer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  hasAccess = true;

  constructor(
    private dataService: DataService,
    private layerService: LayerService,
    private titleService: Title,
  ) {
    // this.dataService.mapEnrollmentScoresToGeoJson().then(console.log);
      this.titleService.setTitle('🌈 Datagarden ✨');
  }

  public getActiveLayer(): ILayer {
    return this.layerService.getActiveLayer();
  }

  keySequence: string[] = [];
  konamiCode: string[] = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a',
    'Enter'
  ]
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.keySequence.push(event.key);
    if (this.keySequence.length > this.konamiCode.length) {
      this.keySequence.shift()
    }
    if (this.konamiCode.every((code: string, index: number) => code === this.keySequence[index])) {
      console.log('ACCESS GRANTED');
      this.hasAccess = !this.hasAccess;
    }
  }
}
