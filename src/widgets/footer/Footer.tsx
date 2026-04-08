import styles from './Footer.module.css';

export function Footer() {
  return (
    <div className={styles.footer}>
      <span className={styles.name}>ANTON KOVALEV</span>
      <span className={styles.separator}>&middot;</span>
      <span>Senior Frontend Developer</span>
      <span className={styles.separator}>&middot;</span>
      <span>9+ yrs</span>
      <span className={styles.separator}>&middot;</span>
      <span>React, Next.js, TypeScript</span>
      <a
        href="https://www.linkedin.com/in/kovalevantondev/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkedIn}
        aria-label="LinkedIn Profile"
      >
        in
      </a>
    </div>
  );
}
