import { FC } from 'react';

interface Props {
  text: string;
  icon: JSX.Element;
  classname: string;
  onClick: () => void;
}

export const KeyButton: FC<Props> = ({ text, icon, classname, onClick }) => {
  return (
    <button
      className={classname}
      onClick={onClick}
    >
      <div>{icon}</div>
      <u>
      <span>{text}</span>
      </u>
    </button>
  );
};
