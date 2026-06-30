package com.fintrack.wallet.service;

import com.fintrack.wallet.domain.Transaction;
import com.fintrack.wallet.domain.Wallet;
import com.fintrack.wallet.dto.TransactionRequest;
import com.fintrack.wallet.dto.TransactionResponse;
import com.fintrack.wallet.dto.WalletSummaryResponse;
import com.fintrack.wallet.exception.ApiException;
import com.fintrack.wallet.pattern.factory.TransactionFactory;
import com.fintrack.wallet.pattern.strategy.TransactionStrategyRegistry;
import com.fintrack.wallet.repository.TransactionRepository;
import com.fintrack.wallet.repository.WalletRepository;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionStrategyRegistry strategyRegistry;
    private final TransactionFactory transactionFactory;

    public WalletService(
            WalletRepository walletRepository,
            TransactionRepository transactionRepository,
            TransactionStrategyRegistry strategyRegistry,
            TransactionFactory transactionFactory
    ) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.strategyRegistry = strategyRegistry;
        this.transactionFactory = transactionFactory;
    }

    public WalletSummaryResponse summary(Principal principal) {
        Wallet wallet = findWallet(principal.getName());
        List<TransactionResponse> transactions = transactionRepository
                .findTop25ByWalletUserEmailOrderByCreatedAtDesc(principal.getName())
                .stream()
                .map(this::toResponse)
                .toList();
        return new WalletSummaryResponse(wallet.getBalance(), transactions);
    }

    @Transactional
    public TransactionResponse createTransaction(Principal principal, TransactionRequest request) {
        Wallet wallet = findWallet(principal.getName());
        strategyRegistry.get(request.type()).apply(wallet, request.amount());
        Transaction transaction = transactionFactory.create(
                wallet,
                request.type(),
                request.amount(),
                request.category(),
                request.note()
        );
        walletRepository.save(wallet);
        return toResponse(transactionRepository.save(transaction));
    }

    private Wallet findWallet(String email) {
        return walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getNote(),
                transaction.getCreatedAt()
        );
    }
}
