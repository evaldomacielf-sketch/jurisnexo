using Xunit;
using Moq;
using FluentAssertions;
using JurisNexo.Application.UseCases.Cases.CreateCase;
using JurisNexo.Core.Interfaces;
using JurisNexo.Core.Entities;

namespace JurisNexo.Tests.Unit.Cases;

public class CreateCaseHandlerTests
{
    private readonly Mock<ICaseRepository> _caseRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly CreateCaseHandler _handler;

    public CreateCaseHandlerTests()
    {
        _caseRepositoryMock = new Mock<ICaseRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new CreateCaseHandler(_caseRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateCase_WhenValidCommand()
    {
        // Arrange
        var command = new CreateCaseCommand(
            Title: "Ação Trabalhista",
            Number: "0001234-56.2026.8.19.0001",
            Description: "Reclamação trabalhista por verbas rescisórias",
            ClientId: Guid.NewGuid(),
            ResponsibleUserId: Guid.NewGuid(),
            Court: "1ª Vara do Trabalho",
            DistributionDate: DateTime.UtcNow
        );

        _caseRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Case>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWorkMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(command.Title);
        result.Number.Should().Be(command.Number);
        
        _caseRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Case>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
