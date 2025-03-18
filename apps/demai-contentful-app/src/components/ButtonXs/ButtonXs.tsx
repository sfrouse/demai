import React from "react";
import styles from "./ButtonXs.module.css";

interface ButtonXsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ButtonXs: React.FC<ButtonXsProps> = ({ children, onClick, ...props }) => {
  return (
    <button className={styles.buttonXs} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default ButtonXs;
