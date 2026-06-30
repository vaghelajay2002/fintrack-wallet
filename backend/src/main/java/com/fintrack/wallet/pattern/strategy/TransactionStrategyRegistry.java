package com.fintrack.wallet.pattern.strategy;

import com.fintrack.wallet.domain.TransactionType;
import com.fintrack.wallet.exception.ApiException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class TransactionStrategyRegistry {
    private final Map<TransactionType, TransactionStrategy> strategies = new EnumMap<>(TransactionType.class);

    public TransactionStrategyRegistry(List<TransactionStrategy> transactionStrategies) {
        transactionStrategies.forEach(strategy -> strategies.put(strategy.supports(), strategy));
    }

    public TransactionStrategy get(TransactionType type) {
        TransactionStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported transaction type");
        }
        return strategy;
    }
}
