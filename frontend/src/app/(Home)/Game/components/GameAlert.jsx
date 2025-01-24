import styles from './GameAlert.module.css';

const GameAlert = ({ isWinner, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={`${styles.alertContainer} ${isWinner ? styles.winner : styles.loser}`}>
                <h2>{isWinner ? 'Victory!' : 'Defeat'}</h2>
                <p>{isWinner ? 'Congratulations! You won the game!' : 'Better luck next time!'}</p>
                <button onClick={onClose} className={styles.closeButton}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default GameAlert; 