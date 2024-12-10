import { IconButton, Input, InputBase } from '@mui/material';
import React, { useState } from "react";

import { SearchIcon } from '../Atoms/Icons';
import classes from './SearchBar.module.css';

const SearchBar: React.FC = () => {
    const [focused, setFocused] = useState(false);

    return (
     <div className={classes.SearchBar}>
        <SearchIcon
            focused={focused}
        />
      <InputBase
        placeholder="Search"
        color='primary'
        classes={{
          root: classes.SearchBarInputRoot,
          input: classes.SearchBarInput,
          focused: classes.SearchBarFocused,
        }}
        inputProps={{ 'aria-label': 'search' }}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
      />
    </div>
    )
}

export default SearchBar;