import classNames from "classnames";
import React from "react";

interface Props {
  children: React.ReactNode;
  center?: boolean;
  style?: React.CSSProperties;
}

export function Wrapper({ children, center, style }: Props) {
  return (
    <div
      className={classNames(
        "flex w-full box-border p-5 justify-start",
        center && "justify-center"
      )}
      style={style}
    >
      {children}
    </div>
  );
}
