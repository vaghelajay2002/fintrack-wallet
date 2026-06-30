package com.fintrack.wallet.pattern.strategy;

import com.fintrack.wallet.domain.TransactionType;
import com.fintrack.wallet.domain.Wallet;
import com.fintrack.wallet.exception.ApiException;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class DebitTransactionStrategy implements TransactionStrategy {
    @Override
    public TransactionType supports() {
        return TransactionType.DEBIT;
    }

    @Override
    public void apply(Wallet wallet, BigDecimal amount) {
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient wallet balance");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
    }
}
