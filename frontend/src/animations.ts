import {  trigger,  state,  style,  animate,  transition, sequence } from '@angular/animations';

export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({'width': '0px'}),
    animate(200, style({'width': '*'}))
  ]),
  transition(':leave', [
    style({'width': '*'}),
    animate('200ms', style({'width': '0px'}))
  ])
])