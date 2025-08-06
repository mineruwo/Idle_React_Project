//package com.fullstack.idle;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import com.fullstack.repository.OrderRepository;
//
//@SpringBootTest
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
//public class DashboardTest {
//
//    @Autowired
//    private OrderRepository orderRepository;
//
//    @Autowired
//    private OrderPropRepositor orderPropRepository;
//
//    @BeforeEach
//    public void insertTestData() {
//        for (long i = 1; i <= 40; i++) {
//            Order order = new Order();
//            order.setOrderId(i);
//            order.setStatus(getRandomStatus());
//            order.setFromLocation("서울");
//            order.setToLocation("부산");
//            order.setDepartureTime(LocalDateTime.now().minusDays((int) i));
//            order.setArrivalTime(LocalDateTime.now().minusDays((int) i).plusHours(6));
//            orderRepository.save(order);
//
//            OrderProp prop = new OrderProp();
//            prop.setPropId("PROP" + i);
//            prop.setOrderId(String.valueOf(i));  // orderId가 String이라면
//            prop.setIdNumT((int) (1000 + i));
//            prop.setProposedPrice(100000 + (int) (Math.random() * 100000));
//            prop.setCommissionRate(8.0 + (Math.random() * 4));
//            prop.setOrder(order);
//            orderPropRepository.save(prop);
//        }
//    }
//
//    private String getRandomStatus() {
//        List<String> statuses = Arrays.asList("완료", "배송중", "배송 예정");
//        return statuses.get(new Random().nextInt(statuses.size()));
//    }
//
//    @Test
//    public void testDashboardApi() {
//        // TODO: /api/dashboard 호출 테스트 작성
//    }
//}