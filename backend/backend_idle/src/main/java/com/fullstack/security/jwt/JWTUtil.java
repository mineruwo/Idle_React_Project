package com.fullstack.security.jwt;

import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

	private final Key key;
	private final Duration accessTtl;
    private final Duration refreshTtl;
    private final String issuer;
    
	public JWTUtil(@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-ttl:PT15M}") Duration accessTtl,
            @Value("${jwt.refresh-ttl:P14D}") Duration refreshTtl,
            @Value("${jwt.issuer:idle-api}") String issuer) 
	{
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
		this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
        this.issuer = issuer;
	}
	
	// 이거 왜 쓰는거지
	public String generateAccessToken(String id, String role) {
        return buildToken(id, role, accessTtl);
    }

    public String generateRefreshToken(String id) {
        return buildToken(id, null, refreshTtl);
    }
	
	public String generateAccessToken(String id, String role, Duration expire) {
		return buildToken(id, role, expire);
	}
	
	public String generateRefreshToken(String id, Duration expire) {
		return buildToken(id, null, expire);
	}
	
	// 공통 빌더
    private String buildToken(String id, String role, Duration ttl) {
    	Instant now = Instant.now();
    	Instant exp = now.plus(ttl);

    	JwtBuilder builder = Jwts.builder()
                .setSubject(id)
                .setIssuer(issuer)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256);
                
        if (role != null) {
        	builder.claim("role", role);
        }

        return builder.compact();
    }
	
	// 토큰에서 ID 추출
	public String getId(String token) {	
		return parseClaims(token).getSubject();
	}
	
	// 토큰에서 role 추출
	public String getRole(String token) {
		return parseClaims(token).get("role", String.class);
	}
	
	// 만료 시간
	public Instant getExpiration(String token) {
		return parseClaims(token)
				.getExpiration()
				.toInstant();
	}
	
	// 토큰 유효성
	public boolean validateToken(String token) {
		try {
			parseClaims(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}
	
	private Claims parseClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
	
}
