package com.fintrack.wallet.pattern.factory;

import com.fintrack.wallet.domain.Transaction;
import com.fintrack.wallet.domain.TransactionType;
import com.fintrack.wallet.domain.Wallet;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class TransactionFactory {
    public Transaction create(Wallet wallet, TransactionType type, BigDecimal amount, String category, String note) {
        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setCategory(blankToDefault(category, type.name()));
        transaction.setNote(blankToDefault(note, "Wallet transaction"));
        transaction.setCreatedAt(Instant.now());
        return transaction;
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
