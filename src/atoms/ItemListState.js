import { atom } from 'recoil';

export const ItemListState = atom({
  key: 'itemList',
  default: [],
});

export default ItemListState;
