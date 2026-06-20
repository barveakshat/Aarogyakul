# Phase 7: End-to-End Testing & Demo Seeding (Hours 36–46)

**Goal:** Validate against real PDFs and seed demo data.

## Tasks

## Testing
- [ ] Test with real PDF samples:
  - [ ] Dr Lal PathLabs format
  - [ ] Thyrocare format
  - [ ] SRL format (if accessible)
- [ ] Fix OCR edge cases:
  - [ ] Scanned PDFs
  - [ ] Non-English reports
  - [ ] Multi-page reports
- [ ] Fix parameter extraction edge cases:
  - [ ] Tables
  - [ ] Footnotes
  - [ ] Reference ranges in different formats
- [ ] Performance testing:
  - [ ] Measure OCR time (<5s expected)
  - [ ] Measure Llama API calls (<15s expected)
  - [ ] Ensure frontend shows "Processing" state during waits
- [ ] Error handling testing:
  - [ ] Invalid PDF
  - [ ] Network failure
  - [ ] Llama API timeout

## Demo Seeding
- [ ] Create test user and family
- [ ] Create member with two blood reports 6 months apart
- [ ] Ensure at least one parameter (HbA1c) shows clear change
- [ ] Verify insight generation works correctly

### Demo Seeding Script
```java
@Component
public class DemoDataSeeder {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private FamilyService familyService;
    @Autowired
    private FamilyMemberService memberService;
    @Autowired
    private MedicalDocumentRepository docRepo;
    @Autowired
    private MedicalParameterRepository paramRepo;
    
    @PostConstruct
    public void seed() {
        // Create test user if not exists
        User user = userRepo.findByEmail("demo@aarogyakul.com")
            .orElseGet(() -> {
                User u = new User();
                u.setEmail("demo@aarogyakul.com");
                u.setFullName("Demo User");
                u.setPasswordHash("$2a$10$..."); // BCrypt hash of "password123"
                return userRepo.save(u);
            });
        
        // Create family if not exists
        Family family = familyService.getMyFamily(user.getId())
            .orElseGet(() -> familyService.createFamily(user.getId(), "Demo Family"));
        
        // Create member
        FamilyMember member = memberService.getMembers(family.getId()).stream()
            .findFirst()
            .orElseGet(() -> memberService.createMember(
                family.getId(), 
                CreateMemberRequest.builder()
                    .fullName("Rajesh Sharma")
                    .dateOfBirth(LocalDate.of(1965, 3, 12))
                    .gender("MALE")
                    .bloodGroup("O+")
                    .relationshipToOwner("Father")
                    .build()
            ));
        
        // Seed two blood reports (6 months apart)
        // Report 1 (6 months ago)
        MedicalDocument doc1 = new MedicalDocument();
        doc1.setFamilyMemberId(member.getId());
        doc1.setFileName("blood_test_jan2025.pdf");
        doc1.setProcessingStatus("COMPLETED");
        doc1.setReportDate(LocalDate.now().minusMonths(6));
        doc1 = docRepo.save(doc1);
        
        MedicalParameter p1 = new MedicalParameter();
        p1.setDocumentId(doc1.getId());
        p1.setFamilyMemberId(member.getId());
        p1.setParameterName("HbA1c");
        p1.setValue(6.2);
        p1.setUnit("%");
        p1.setReportDate(doc1.getReportDate());
        paramRepo.save(p1);
        
        // Report 2 (current)
        MedicalDocument doc2 = new MedicalDocument();
        doc2.setFamilyMemberId(member.getId());
        doc2.setFileName("blood_test_jul2025.pdf");
        doc2.setProcessingStatus("COMPLETED");
        doc2.setReportDate(LocalDate.now());
        doc2 = docRepo.save(doc2);
        
        MedicalParameter p2 = new MedicalParameter();
        p2.setDocumentId(doc2.getId());
        p2.setFamilyMemberId(member.getId());
        p2.setParameterName("HbA1c");
        p2.setValue(7.1);
        p2.setUnit("%");
        p2.setReportDate(doc2.getReportDate());
        paramRepo.save(p2);
        
        log.info("Demo data seeded successfully");
    }
}
```

## Deliverable
End-to-end working system with demo data showing trend analysis.

## Success Criteria
A fresh user can upload a second blood report 6 months after the first, and the system automatically shows:
> _"HbA1c increased from 6.2% to 7.1% over the last 6 months — your blood sugar control has worsened"_
