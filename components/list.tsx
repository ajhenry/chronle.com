import classNames from "classnames";
import React, { forwardRef } from "react";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  style?: React.CSSProperties;
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({ children, columns = 1, style }: Props, ref) => {
    return (
      <ul
        ref={ref}
        style={
          {
            ...style,
            "--columns": columns,
          } as React.CSSProperties
        }
        className={classNames(
          "grid box-border min-w-[350px] gap-5 p-5 pb-0 m-5 rounded-md min-h-[200px] transition duration-350 ease-in-out",
          "after:h-0 after:content-[''] after:grid-column-start-[span var(--columns, 1)]"
        )}
      >
        {children}
      </ul>
    );
  }
);
