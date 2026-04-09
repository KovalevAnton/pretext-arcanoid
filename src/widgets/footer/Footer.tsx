import { useI18n } from "@/shared/i18n";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useI18n();

  return (
    <div className={styles.footer}>
      <span className={styles.name}>ANTON KOVALEV</span>
      <span className={styles.separator}>&middot;</span>
      <span>{t.role}</span>
      <span className={styles.separator}>&middot;</span>
      <span>{t.experience}</span>
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
      <span className={styles.separator}>&middot;</span>
      <span className={styles.credits}>
        {t.inspiredBy}{" "}
        <a
          href="https://github.com/rinesh/pretext-breaker/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.creditLink}
        >
          pretext-breaker
        </a>{" "}
        &amp;{" "}
        <a
          href="https://github.com/chenglou/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.creditLink}
        >
          Cheng Lou
        </a>
      </span>
    </div>
  );
}
