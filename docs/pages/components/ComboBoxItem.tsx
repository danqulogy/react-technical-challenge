import * as React from 'react';
import { Country } from '../models/Country';
import styles from './ComboBoxItem.module.css';

type ComboBoxItemProps = {
  country: Country;
  onSelected: Function;
};
export default function ComboBoxItem({ country, onSelected }: ComboBoxItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelected(country.label)}
        className={styles.suggestedItem}
      >
        {country.label}
      </button>
    </li>
  );
}
