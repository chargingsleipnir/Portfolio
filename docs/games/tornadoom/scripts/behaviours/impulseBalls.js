
function ImpulseBallBehaviour(gameObj) {

    var Cr = 1.0;
    function CollResponse(c) {
        var collisionDist = gameObj.collider.sphere.IntersectsSphere(c.sphere);
        gameObj.rigidBody.CalculateImpulse(c.rigidBody, collisionDist, Cr);
    }

    gameObj.collider.SetResponseCall(CollResponse);

    gameObj.rigidBody.SetMass(0.5);
    gameObj.rigidBody.SetInertiaTensor(gameObj.collider.sphere.radius);
    gameObj.rigidBody.dampening = 0.9;
}