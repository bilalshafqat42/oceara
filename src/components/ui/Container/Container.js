import styles from "./Container.module.css";

export default function Container({
  children,
  as: Element = "div",
  className = "",
  size = "default",
  id,
}) {
  const classes = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Element id={id} className={classes}>
      {children}
    </Element>
  );
}
