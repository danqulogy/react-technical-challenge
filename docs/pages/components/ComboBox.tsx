import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import styles from './ComboBox.module.css';
import { Country } from '../models/Country';

function useOnClickOutside(
  ref: React.MutableRefObject<any>,
  inputHandler: Function,
  selectionsHandler: Function,
) {
  useEffect(() => {
    const listener = (e: any) => {
      if (!ref.current || ref.current.contains(e?.target)) {
        return;
      }

      if (e?.target.className === 'comboxItemButton') {
        selectionsHandler(e.target.textContent);
      }

      inputHandler(e);
    };
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, inputHandler, selectionsHandler]);
}

const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

type ComboBoxProps = {
  dataSource: Country[];
};

export default function ComboBox({ dataSource }: ComboBoxProps) {
  const [showSelectionsSheet, setShowSelectionsSheet] = useState(false);
  const [selected, setSelected] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [defaultList] = useState(dataSource.filter((e) => e.suggested));
  const [filteredList, setFilteredList] = useState([] as Country[]);

  const inputRef: React.MutableRefObject<null|HTMLInputElement> = useRef(null);
  // const suggestionListRef = useRef();

  const suggestionSelected = (value: string) => {
    setSelected(value);
    setShowSelectionsSheet(false);
  };

  const hideSelectionSheet = () => {
    setShowSelectionsSheet(false);
    setCurrentIndex(-1);
  };

  useOnClickOutside(inputRef, hideSelectionSheet, suggestionSelected);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    // e.preventDefault();
    setSelected(e.target.value);

    const matches = dataSource
      .filter((i) => i.label.toLowerCase().includes(selected.toLowerCase()))
      .slice(0, 6);
    setFilteredList(matches);
  }

  const renderedList = selected.length && showSelectionsSheet ? filteredList : defaultList;

  function focusOnOption() {
    // Handles focus if index is > -1
    // if(currentIndex < 0) return;

    // Handle focusing operations
    console.log(`li${currentIndex}`);
    document.getElementById(`li${currentIndex}`)?.focus();
    inputRef.current?.setAttribute("aria-activedescendant", `li${currentIndex}`)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement | HTMLLIElement>,
  ) => {
    // Write edge case test
    if (e.key === 'Escape') {
      hideSelectionSheet();
    }

    if (e.key === 'ArrowDown') {
      if (!showSelectionsSheet) {
        setShowSelectionsSheet(true);
        setCurrentIndex(0);
        return;
      }

      if (showSelectionsSheet) {
        if (currentIndex === -1) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex((current) => (current + 1 >= renderedList.length ? 0 : current + 1));
          focusOnOption();
        }
      }
    }

    if (e.key === 'Enter') {
      if (!showSelectionsSheet) {
        setCurrentIndex(-1);
      } else {
        const currentLineItem = renderedList[currentIndex - 1];
        setSelected(
          currentLineItem ? currentLineItem.label : renderedList[renderedList.length - 1].label,
        );
        setShowSelectionsSheet(false);
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div
      className={styles.container}
      style={showSelectionsSheet ? { backgroundColor: 'white' } : {}}
    >
      <input
        id="comboInput"
        role="combobox"
        aria-label="Search"
        aria-autocomplete="both"
        aria-controls="comboListBox"
        aria-expanded="false"
        data-active-option={renderedList && renderedList.length && renderedList[0]?.code} // id
        aria-activedescendant={selected}
        ref={inputRef}
        value={selected}
        onClick={() => setCurrentIndex(-1)}
        onChange={(e) => onInputChange(e)}
        onKeyDown={(e) => handleKeyDown(e)}
        placeholder="Search Countries"
        className={styles.inputText}
        type="text"
      />

      <div>
        <ul
          id="comboListBox"
          role="listbox"
          aria-orientation="vertical"
          aria-label="Suggestions"
          style={{ display: showSelectionsSheet ? 'block' : 'none' }}
          className={styles.suggestionList}
        >
          {renderedList.map((country, index) => (
            <li
              id={`li${index}`}
              role="option"
              aria-selected="false"
              key={country.code}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e)}
              className={`comboxItemButton ${styles.suggestedItem}`}
            >
              {index} {country.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
