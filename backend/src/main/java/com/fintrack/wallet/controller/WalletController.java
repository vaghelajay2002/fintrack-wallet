package com.fintrack.wallet.controller;

import com.fintrack.wallet.dto.TransactionRequest;
import com.fintrack.wallet.dto.TransactionResponse;
import com.fintrack.wallet.dto.WalletSummaryResponse;
import com.fintrack.wallet.service.WalletService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    WalletSummaryResponse summary(Principal principal) {
        return walletService.summary(principal);
    }

    @PostMapping("/transactions")
    TransactionResponse createTransaction(
            Principal principal,
            @Valid @RequestBody TransactionRequest request
    ) {
        return walletService.createTransaction(principal, request);
    }
}
