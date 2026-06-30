package com.fintrack.wallet.repository;

import com.fintrack.wallet.domain.Wallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserEmail(String email);
}
