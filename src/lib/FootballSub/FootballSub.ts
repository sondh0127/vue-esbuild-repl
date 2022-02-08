import { defaultMetadata } from '../constants/defaultMetadata'

export const metadata = {
  ...defaultMetadata,
  size: 80,
  question: 'Theo bạn đội nào sẽ bị thẻ vàng trong trận đấu này?',
  answers: [
    { id: 'Hà Nội', percent: 0, count: 0 },
    { id: 'TP HCM', percent: 0, count: 0 },
    { id: 'Không đội nào', percent: 0, count: 0 },
  ],
  template: 'FootballSub',
  calcSameAnswer: false,
  // template meta
  screenOrientation: 'landscape',
  scale: 1,
  position: 'bottom',
}
