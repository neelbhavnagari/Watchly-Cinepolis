import React from 'react'
import styles from "@/app/loading.module.css"
export default function CoffeeLoader() {
    return (
        <div className={styles.loader}>
            <div className={styles.cup}>
                <div className={styles.cupHandle}></div>
                <div className={`${styles.smoke} ${styles.one}`}></div>
                <div className={`${styles.smoke} ${styles.two}`}></div>
                <div className={`${styles.smoke} ${styles.three}`}></div>
            </div>
            <div className={styles.load}>Loading...</div>
        </div>
    )
}
