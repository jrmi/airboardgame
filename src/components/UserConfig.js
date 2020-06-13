import React from 'react';
import { BlockPicker } from 'react-color';

const UserConfig = ({ user, setUser, editable }) => {
  const [name, setName] = React.useState(user.name);
  const [showPicker, setShowPicker] = React.useState(false);

  const handleChange = (e) => {
    setName(e.target.value);
    setUser({ ...user, name: e.target.value });
  };

  const handleChangecolor = (newColor) => {
    setUser({ ...user, color: newColor.hex });
    setShowPicker(false);
  };

  const showColorPicker = () => {
    if (editable) {
      setShowPicker((prev) => !prev);
    }
  };

  return (
    <>
      <span
        style={{
          backgroundColor: user.color,
          width: '20px',
          height: '20px',
          margin: '5px',
          cursor: editable ? 'pointer' : 'auto',
        }}
        onClick={showColorPicker}
      ></span>
      {showPicker && (
        <div
          style={{
            position: 'absolute',
            top: '38px ',
            left: '-53px',
            zIndex: 1000,
          }}
        >
          <BlockPicker
            color={user.color}
            onChangeComplete={handleChangecolor}
          />
        </div>
      )}
      {editable && (
        <input
          style={{
            border: 'none',
            padding: '2px',
            paddingLeft: '0.5em',
            backgroundColor: '#CCC',
            width: '7em',
          }}
          value={name}
          onChange={handleChange}
        />
      )}
      {!editable && (
        <span style={{ lineHeight: '30px', paddingLeft: '0.5em' }}>
          {user.name}
        </span>
      )}
    </>
  );
};

export default UserConfig;
