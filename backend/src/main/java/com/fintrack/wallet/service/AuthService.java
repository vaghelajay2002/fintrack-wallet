package com.fintrack.wallet.service;

import com.fintrack.wallet.domain.User;
import com.fintrack.wallet.domain.Wallet;
import com.fintrack.wallet.dto.AuthRequest;
import com.fintrack.wallet.dto.AuthResponse;
import com.fintrack.wallet.dto.RegisterRequest;
import com.fintrack.wallet.exception.ApiException;
import com.fintrack.wallet.repository.UserRepository;
import com.fintrack.wallet.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        user.setWallet(wallet);

        User savedUser = userRepository.save(user);
        return tokenResponse(savedUser);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return tokenResponse(user);
    }

    private AuthResponse tokenResponse(User user) {
        return new AuthResponse(jwtService.createToken(user.getEmail()), user.getFullName(), user.getEmail());
    }
}
