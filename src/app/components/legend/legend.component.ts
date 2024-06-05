import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ILayer } from 'src/app/types/layer';
import chroma from 'chroma-js';
import { LayerService } from 'src/app/services/layer/layer.service';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnChanges, AfterViewInit {
  @Input() layer!: ILayer;
  @ViewChild('gradient') gradient?: ElementRef;
  @ViewChild('wrapper') wrapper?: ElementRef;

  constructor(
    private layerService: LayerService,
  ) { }

  ngAfterViewInit(): void {
    this.updateGradient();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateGradient();
  }

  getMin(): number | string {
    return this.layer.min !== undefined ? this.layer.min : '[min]';
  }

  getMax(): number | string {
    return this.layer.max !== undefined ? this.layer.max : '[max]';
  }

  private updateGradient() {
    if (this.gradient && this.wrapper) {
      if (this.layer.style) {
        this.wrapper.nativeElement.style.display = '';
        const fromColor = this.layer.style.fromColor;
        const toColor = this.layer.style.toColor;
        let colors = chroma.scale([fromColor, toColor]).mode('hsv').colors(20);
        if (this.layerService.getActiveLayer().id === LayerService.familyScoreDiffLayerId) {
          colors = chroma.scale([fromColor, toColor]).mode('hsv').colors(20);
        }
        let linearGradient = 'linear-gradient(0deg';
        colors.forEach((color, i) => {
          linearGradient += `, ${color} ${Math.round((i / (colors.length - 1) * 100))}%`;
        });
        linearGradient += ')';
        this.gradient.nativeElement.style.background = linearGradient;
      } else {
        this.wrapper.nativeElement.style.display = 'none';
      }
    }
  }
}
