package com.fintrack.wallet.repository;

import com.fintrack.wallet.domain.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findTop25ByWalletUserEmailOrderByCreatedAtDesc(String email);
    List<Transaction> findTop100ByWalletUserEmailOrderByCreatedAtDesc(String email);
}
