import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LayerService } from 'src/app/services/layer/layer.service';
import { ILayer } from 'src/app/types/layer';

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  @Input() layer!: ILayer;
  @Output() onChange = new EventEmitter<number>();
  value: number;

  constructor() {
    this.value = LayerService.currentLayerVariationIndex;
  }

  public emitOutput(index: number) {
    this.onChange.emit(index);
  }
}
